from celery import shared_task
from .models import User, Reservation
from .utils import format_report
from .mail import send_email
import datetime
import csv




@shared_task(ignore_results=False, name="monthly_reservation_report")
def monthly_reservation_report():
    users = User.query.all()
    for user in users:
        user_data = {
            "username": user.username,
            "email": user.email,
            "reservations": []
        }

        for res in user.reservations:
            this_res = {
                "lot": res.lot_name_snapshot,
                "spot": res.spot_number_snapshot,
                "vehicle": res.vehicle_number,
                "booked_at": res.parking_timestamp.strftime("%d-%m-%Y %I:%M %p"),
                "released_at": res.release_timestamp.strftime("%d-%m-%Y %I:%M %p") if res.release_timestamp else "Not Released",
                "cost": res.parking_cost if res.parking_cost else "Pending"
            }
            user_data["reservations"].append(this_res)

        # Format and send email (template in `templates/mail_reservations.html`)
        message = format_report('templates/mail_reservations.html', user_data)
        send_email(user.email, subject="📊 Monthly Parking Report", message=message)

    return "Monthly reservation reports sent."



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
