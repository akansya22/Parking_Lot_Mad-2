export default {
    template: `
    <div class="row border">
        <div class="col-12">
            <h2 class="mt-3 text-end">Welcome, {{ username }}</h2>

            <div class="row border">
                <div class="col-6 border" style="height: 300px; overflow-y: scroll;">
                    <h4 class="mt-3 text-primary fw-bold">Available Parking Lots</h4>
                    <ul class="list-group">
                        <li v-for="lot in lots" :key="lot.id" class="list-group-item d-flex justify-content-between align-items-center">
                            {{ lot.name }} - Spots: {{ lot.total_spots }}
                            <button class="btn btn-success btn-sm" @click="bookSpot(lot.id)">Book</button>
                        </li>
                    </ul>
                </div>

                <div class="col-6 border" style="height: 300px; overflow-y: scroll;">
                    <h4 class="mt-3 text-success fw-bold">Your Booked Spots</h4>
                    <ul class="list-group">
                        <li v-for="booking in bookings" :key="booking.id" class="list-group-item d-flex justify-content-between align-items-center">
                            {{ booking.lot_name }} - Spot: {{ booking.spot_number }}
                            <button class="btn btn-danger btn-sm" @click="releaseSpot(booking.id)">Release</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            username: localStorage.getItem('username') || 'User',
            lots: [],
            bookings: []
        };
    },
    methods: {
        fetchLots() {
            fetch('/api/lots')
                .then(res => res.json())
                .then(data => {
                    this.lots = data;
                });
        },
        fetchBookings() {
            const userId = localStorage.getItem('id');
            fetch(`/api/user/bookings?id=${userId}`)
                .then(res => res.json())
                .then(data => {
                    this.bookings = data;
                });
        },
        bookSpot(lotId) {
            const userId = localStorage.getItem('id');
            fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, lot_id: lotId })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                this.fetchLots();
                this.fetchBookings();
            });
        },
        releaseSpot(bookingId) {
            fetch(`/api/release?id=${bookingId}`, {
                method: 'POST'
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                this.fetchLots();
                this.fetchBookings();
            });
        }
    },
    mounted() {
        this.fetchLots();
        this.fetchBookings();
    }
};
