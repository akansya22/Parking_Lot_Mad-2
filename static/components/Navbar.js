export default {
    template: `
    <div class="row border">
        <div class="col-10 fs-2 border">
            Vehicle Parking
        </div>
        <div class="col-2 border">
            <div v-if="!loggedIn">
                <router-link class="btn btn-primary my-2" to="/login">Login</router-link>
                <router-link class="btn btn-warning my-2" to="/register">Register</router-link>
            </div>
            <div v-else>
                <button class="btn btn-danger my-2" @click="logout">Logout</button>
            </div>
        </div>
    </div>`,
    data() {
        return {
            loggedIn: !!localStorage.getItem('auth_token')
        };
    },
    methods: {
        logout() {
            localStorage.removeItem('auth_token');
            this.loggedIn = false;
            this.$router.push('/login');
        }
    }
};
