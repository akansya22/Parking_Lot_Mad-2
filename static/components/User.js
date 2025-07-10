export default {
  template: `
    <div class="row border">
      <div style="height: 630px;">
      <div class="col-12">

        <div class="row border">
          <!-- Available Parking Lots -->
          
          <div class="col-6 border" style="height: 630px; overflow-y: scroll;">
            <h4 class="mt-3 text-primary fw-bold">Available Parking Lots</h4>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Available Spots</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lot in lots" :key="lot.id">
                  <td>{{ lot.location_name }}</td>
                  <td>{{ (lot.number_of_spots || 0) - (lot.occupied_spots || 0) }}</td>

                  <td>
                    <button class="btn btn-success btn-sm" @click="openBookingForm(lot.id)">Book</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Booked Spots -->
          <div class="col-6 border" style="height: 630px; overflow-y: scroll;">
            <h4 class="mt-3 text-success fw-bold">Your Booked Spots</h4>
            <ul class="list-group">
              <li v-for="booking in bookings" :key="booking.id" class="list-group-item">
                <div>
                  <strong>Location:</strong> {{ booking.lot_name }}<br/>
                  <strong>Spot:</strong> {{ booking.spot_number }}<br/>
                  <strong>Vehicle No.:</strong> {{ booking.vehicle_number }}<br/>
                  <strong>Parking Time:</strong> {{ formatLocalTime(booking.time) }}<br/>
                  <span v-if="booking.released">
                  <strong>Release Time:</strong> {{ formatLocalTime(booking.release_time) }}<br/>
                  </span>
                  <strong>Status:</strong>
                  <span :class="booking.released ? 'text-danger' : 'text-success'">
                    {{ booking.released ? 'Released' : 'Parked' }}
                  </span>
                </div>
                <div class="text-end" v-if="!booking.released">
                  <button class="btn btn-danger btn-sm mt-2" @click="releaseSpot(booking.id)">Release</button>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <!-- Booking Modal -->
      <div v-if="showBookingModal" class="modal d-block" style="background: rgba(0,0,0,0.6);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Reserve a Spot</h5>
              <button class="btn-close" @click="cancelBooking()"></button>
            </div>
            <div class="modal-body">
              <p><strong>User ID:</strong> {{ userId }}</p>
              <p><strong>Lot ID:</strong> {{ selectedLotId }}</p>
              <p><strong>Spot ID:</strong> Auto-assigned</p>

              <input v-model="vehicleNumber" class="form-control mb-3" placeholder="Enter Vehicle Number" required>

              <div class="text-end">
                <button class="btn btn-secondary me-2" @click="cancelBooking()">Cancel</button>
                <button class="btn btn-primary" @click="confirmBooking()">Reserve</button>
              </div>
            </div>
          </div>
        </div>
      </div>

     <!-- Release Confirmation Modal -->
    <div v-if="showReleaseModal" class="modal d-block" style="background: rgba(0,0,0,0.6);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Release Confirmation</h5>
            <button class="btn-close" @click="cancelRelease()"></button>
          </div>
          <div class="modal-body">
            <p><strong>Vehicle Number:</strong> {{ releaseData.vehicle_number }}</p>
            <p><strong>Parking Time:</strong> {{ releaseData.time }}</p>
            <p><strong>Release Time:</strong> {{ releaseData.release_time }}</p>
            <p><strong>Total Cost:</strong> ₹{{ releaseData.total_cost }}</p>

            <div class="text-end">
              <button class="btn btn-secondary me-2" @click="cancelRelease()">Cancel</button>
              <button class="btn btn-danger" @click="confirmRelease()">Confirm Release</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  `,

  data() {
    return {
      username: localStorage.getItem('username') || 'User',
      userId: localStorage.getItem('id'),
      lots: [],
      bookings: [],
      showBookingModal: false,
      selectedLotId: null,
      vehicleNumber: '',
      showReleaseModal: false,
      releaseData: {
        id: null,
        vehicle_number: '',
        time: '',
        release_time: '',
        total_cost: 0
      }

    };
  },

  methods: {
    fetchLots() {
      fetch('/api/lot', {
        headers: {
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          this.lots = data;
        });
    },

    fetchBookings() {
      fetch('/api/user/bookings', {
        headers: {
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          this.bookings = data;
        });
    },

    openBookingForm(lotId) {
      this.selectedLotId = lotId;
      this.vehicleNumber = '';
      this.showBookingModal = true;
    },

    cancelBooking() {
      this.showBookingModal = false;
      this.selectedLotId = null;
      this.vehicleNumber = '';
    },

    confirmBooking() {
      console.log("👉 Booking submitted");
      console.log("Lot ID:", this.selectedLotId);
      console.log("Vehicle Number:", this.vehicleNumber);

      fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify({
          lot_id: this.selectedLotId,
          vehicle_number: this.vehicleNumber
        })
      })
        .then(res => {
          console.log("Status:", res.status);
          return res.json();
        })
        .then(data => {
          console.log("Response:", data);
          alert(data.message);
          this.fetchLots();
          this.fetchBookings();
          this.cancelBooking();
        })
        .catch(err => {
          console.error("❌ Booking failed:", err);
          alert("Something went wrong. Try again.");
        });
    },

    releaseSpot(spotId) {
      const booking = this.bookings.find(b => b.id === spotId);
      if (!booking) return;

      const parkedTimeUTC = new Date(booking.time);       // from backend
      const now = new Date();                              // current time

      const durationInHours = Math.max(1, Math.ceil((now - parkedTimeUTC) / (1000 * 60 * 60)));
      const costPerHour = booking.price_per_hour || 20;
      const totalCost = durationInHours * costPerHour;

      this.releaseData = {
        id: booking.id,
        vehicle_number: booking.vehicle_number,
        spot_number: booking.spot_number,
        time: parkedTimeUTC.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }),
        release_time: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }),
        total_cost: totalCost
      };

      this.showReleaseModal = true;
    },


    confirmRelease() {
      fetch('/api/release', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem("auth_token")
        },
        body: JSON.stringify({ spot_id: this.releaseData.id })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          this.fetchLots();
          this.fetchBookings();
          this.cancelRelease();
        })
        .catch(err => {
          console.error("❌ Release failed:", err);
          alert("Something went wrong during release.");
        });
    },

    cancelRelease() {
      this.showReleaseModal = false;
      this.releaseData = {
        id: null,
        vehicle_number: '',
        time: '',
        release_time: '',
        total_cost: 0
      };
    },
    formatLocalTime(utcString) {
      if (!utcString) return 'N/A';
      const localDate = new Date(utcString);
      return localDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true
      });
    }



    
  },
  mounted() {
    this.fetchLots();
    this.fetchBookings();
  }
};
