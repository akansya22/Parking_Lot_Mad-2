export default {
  template: `
    <div class="container mt-4" style="max-width: 800px; height: 610px;">
    
      <h3 class="text-primary mb-4">User Parking Summary</h3>

      <!-- Chart Container -->
      <div>
        <canvas id="usageChart" width="600" height="300"></canvas>
      </div>
    </div>
    </div>
  `,

  data() {
    return {
      bookings: [],
      chartInstance: null
    };
  },

  methods: {
    fetchBookings() {
      fetch('/api/user/bookings', {
        headers: {
          'Authentication-Token': localStorage.getItem('auth_token')
        }
      })
        .then(res => res.json())
        .then(data => {
          this.bookings = data;
          const freq = this.getParkingFrequency(data);
          this.renderChart(freq);
        })
        .catch(err => {
          console.error("Failed to fetch bookings:", err);
        });
    },

    getParkingFrequency(data) {
      const map = {};
      data.forEach(entry => {
        const loc = entry.lot_name;
        map[loc] = (map[loc] || 0) + 1;
      });
      return map;
    },

    renderChart(freqMap) {
      const ctx = document.getElementById('usageChart').getContext('2d');

      // Destroy previous chart if exists
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      // Create new chart
      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(freqMap),
          datasets: [{
            label: 'Number of Times Parked',
            data: Object.values(freqMap),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Parking Frequency by Location'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              },
              title: {
                display: true,
                text: 'Times Parked'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Location'
              }
            }
          }
        }
      });
    }
  },

  mounted() {
    this.fetchBookings();
  }
};
