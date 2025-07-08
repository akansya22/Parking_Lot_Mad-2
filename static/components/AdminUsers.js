export default {
  data() {
    return {
      users: [],
      message: ""
    };
  },
  async mounted() {
    try {
      const res = await fetch("/api/users", {
        headers: {
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      });
      const data = await res.json();
      this.users = data;
    } catch (err) {
      this.message = "Failed to load users.";
      console.error(err);
    }
  },
  template: `
    <div class="container mt-4">
      <div v-if="message" class="alert alert-danger">{{ message }}</div>
      <div class="card">
        <div class="card-header bg-primary text-white">Registered Users</div>
        <div class="card-body">
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.roles.join(', ') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
};
