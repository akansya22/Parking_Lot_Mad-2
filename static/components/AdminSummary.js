export default {
  template: `
    <div class="mt-4">
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

      <div class="text-center mt-4" v-if="!summary">
        <p class="text-muted">Loading summary...</p>
      </div>
    </div>
  `,

  data() {
    return {
      summary: null
    };
  },

  async mounted() {
    try {
      const res = await fetch("/api/admin/summary", {
        headers: {
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      });
      const data = await res.json();
      this.summary = data;
    } catch (err) {
      console.error("Failed to fetch admin summary", err);
    }
  }
};
