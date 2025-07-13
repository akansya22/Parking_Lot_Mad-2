from celery import shared_task
from .models import User, Reservation
from .utils import format_report
from .mail import send_email
import datetime
import csv


@shared_task(ignore_results=False, name="download_reservations_csv")
def download_reservations_csv():
    reservations = Reservation.query.all()
    filename = f"reservations_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    filepath = f'static/{filename}'
    with open(filepath, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            "Username", "Email", "Lot Name", "Vehicle Number",
            "Spot Number", "Booking Time", "Release Time", "Cost"
        ])
        for res in reservations:
            writer.writerow([
                res.bearer.username if res.bearer else "N/A",
                res.bearer.email if res.bearer else "N/A",
                res.lot_name_snapshot,
                res.vehicle_number,
                res.spot_number_snapshot,
                res.parking_timestamp.strftime('%d-%m-%Y %I:%M %p'),
                res.leaving_timestamp.strftime('%d-%m-%Y %I:%M %p') if res.leaving_timestamp else "Not Released",
                res.parking_cost if res.parking_cost else "Pending"
            ])
    return filename



@shared_task(ignore_results=False, name="monthly_reservation_report")
def monthly_reservation_report():
    users = [u for u in User.query.all() if "admin" not in [r.name for r in u.roles]]
    for user in users:
        user_data = {
            "username": user.username,
            "reservations": []
        }
        for res in user.reservations:
            user_data["reservations"].append({
                "lot": res.lot_name_snapshot,
                "vehicle": res.vehicle_number,
                "spot": res.spot_number_snapshot,
                "booked_at": res.parking_timestamp.strftime("%d-%m-%Y %I:%M %p"),
                "released_at": res.leaving_timestamp.strftime("%d-%m-%Y %I:%M %p") if res.leaving_timestamp else "Not Released",
                "cost": res.parking_cost if res.parking_cost else "Pending"
            })
        html_message = format_report("templates/mail_details.html", user_data)
        send_email(
            user.email,
            subject="Monthly Parking Report",
            message=html_message,
            content="html"
        )
    return "Monthly reservation reports sent."



@shared_task(ignore_results=True, name="daily_reminder")
def daily_reminder():
    now = datetime.datetime.utcnow()
    inactive_since = now - datetime.timedelta(days=2)
    users = [u for u in User.query.all() if "admin" not in [r.name for r in u.roles]]
    for user in users:
        recent = Reservation.query.filter(
            Reservation.user_id == user.id,
            Reservation.parking_timestamp >= inactive_since
        ).first()
        if not recent:
            user_data = {
                "username": user.username,
                "reservations": []
            }
            for res in user.reservations:
                user_data["reservations"].append({
                    "lot": res.lot_name_snapshot,
                    "vehicle": res.vehicle_number,
                    "spot": res.spot_number_snapshot,
                    "booked_at": res.parking_timestamp.strftime("%d-%m-%Y %I:%M %p"),
                    "released_at": res.release_timestamp.strftime("%d-%m-%Y %I:%M %p") if res.release_timestamp else "Not Released",
                    "cost": res.parking_cost if res.parking_cost else "Pending"
                })
            html_message = format_report("templates/mail_details.html", user_data)
            send_email(
                user.email,
                subject="Daily Parking Reminder with Your Activity",
                message=html_message,
                content="html"
            )
    return "Detailed daily reminders sent."
