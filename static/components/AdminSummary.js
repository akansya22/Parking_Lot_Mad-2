export default {
  template: `
    <div class="container mt-4" style="max-width: 1000px; height: 610px;" >
      <h3 class="text-center text-primary">📊 Admin Summary</h3>

      <div class="row mt-4">
        <div class="col-md-4" v-if="summary">
          <div class="card text-white bg-success mb-3">
            <div class="card-body">
              <h5 class="card-title">Total Users</h5>
              <p class="card-text fs-4">{{ summary.total_users }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-4" v-if="summary">
          <div class="card text-white bg-info mb-3">
            <div class="card-body">
              <h5 class="card-title">Total Parking Lots</h5>
              <p class="card-text fs-4">{{ summary.total_lots }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-4" v-if="summary">
          <div class="card text-white bg-danger mb-3">
            <div class="card-body">
              <h5 class="card-title">Total Spots</h5>
              <p class="card-text fs-4">{{ summary.total_spots }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="container mt-4" style="max-width: 800px;">
        <h5 class="text-center text-secondary">Parking Spot Occupancy</h5>
        <canvas id="lotChart" height="100"></canvas>
      </div>

      <div class="text-center mt-4" v-if="!summary">
        <p class="text-muted">Loading summary...</p>
      </div>
    </div>
  `,


  data() {
    return {
      summary: null,
      lotStats: []
    };
  },

  async mounted() {
    try {
      const headers = {
        "Authentication-Token": localStorage.getItem("auth_token")
      };

      // Fetch summary
      const summaryRes = await fetch("/api/admin/summary", { headers });
      const summaryData = await summaryRes.json();
      this.summary = summaryData;

      // Fetch lot stats
      const statsRes = await fetch("/api/admin/lot-stats", { headers });
      const statsData = await statsRes.json();
      this.lotStats = statsData;

      // Wait for DOM then render chart
      this.$nextTick(() => this.renderChart());

    } catch (err) {
      console.error("Failed to fetch admin summary or lot stats", err);
    }
  },
  methods: {
    renderChart() {
      const labels = this.lotStats.map(l => l.location_name);
      const occupiedData = this.lotStats.map(l => l.occupied);
      const availableData = this.lotStats.map(l => l.available);

      const ctx = document.getElementById('lotChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Occupied Spots',
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              data: occupiedData
            },
            {
              label: 'Available Spots',
              backgroundColor: 'rgba(75, 192, 192, 0.7)',
              data: availableData
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true
            },
            y: {
              beginAtZero: true,
              stacked: true
            }
          }
        }
      });
    }
  }


};
