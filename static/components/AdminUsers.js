export default {
  template: `
    <div class="container mt-4" style="height: 610px;">
      <h3 class="text-primary text-center mb-4">Registered Users & Bookings</h3>
      <div v-for="user in users" :key="user.id" class="card mb-3 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">ID: {{ user.id }} | Username: {{ user.username }}</h5>

          <div v-if="user.bookings && user.bookings.length > 0">

            <table class="table table-bordered mt-3">
              <thead class="table-light">
                <tr>
                  <th>Location</th>
                  <th>Vehicle Number</th>
                  <th>Parking Time</th>
                  <th>Release Time</th>
                  <th>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in user.bookings" :key="booking.time + booking.vehicle_number">
                  <td>{{ booking.lot_name }}</td>
                  <td>{{ booking.vehicle_number }}</td>
                  <td>{{ booking.time }}</td>
                  <td>
                    <span v-if="booking.release_time">{{ booking.release_time }}</span>
                    <span v-else class="text-muted">Still Parked</span>
                  </td>
                  <td>
                    <span v-if="booking.amount_paid && booking.amount_paid > 0">₹{{ booking.amount_paid }}</span>
                    <span v-else class="text-warning">Pending</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-muted">No bookings yet.</div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      users: []
    };
  },

  methods: {
    fetchUsers() {
      fetch("/api/users", {
        headers: {
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          this.users = data;
        })
        .catch(err => {
          console.error("Failed to fetch users:", err);
          alert("Something went wrong while loading user data.");
        });
    }
  },

  mounted() {
    this.fetchUsers();
  }
};
