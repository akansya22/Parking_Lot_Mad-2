export default {
    template: `
    <div class="row border">
        <div class="col-10 fs-2 border">
            Fast Logistics
        </div>
        <div class="col-2 border">
            <div v-if="loggedIn">
                <router-link class= "btn btn-primary my-2" to="/login">Login</router-link>
                <router-link class= "btn btn-warning my-2" to="/register">Register</router-link>
            </div>
            <div v-else>
                <router-link class= "btn btn-danger my-2" to="/login">Logout</router-link>
            </div>
        </div>
    </div>`,
    data: function() {
        return {
            loggedIn: localStorage.getItem('auth_token'),
        };
    },
    watch: {
        loggedIn(new_val, old_val) {
            this.$router.go(0); // Refresh the page to reflect changes
        }
    }
}