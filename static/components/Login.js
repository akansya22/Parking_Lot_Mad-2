export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 620px;">
            <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
                <div>
                    <h2 class="text-center">Login Form</h2>
                    <p class="mx-2 mt-2 text-danger">{{message}}</p>
                    <div class="mx-2 mb-3">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="name@example.com">
                    </div>
                    <div class="mx-2 mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" v-model="formData.password">
                    </div>
                    <div class="mb-3 text-center">
                        <button class="btn btn-primary" @click="loginUser">Login</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`,

    data: function () {
        return {
            formData: {
                email: '',
                password: ''
            },
            message: ''
        };
    },
    methods: {
        loginUser: function () {
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data["auth-token"]) {
                    localStorage.setItem("auth_token", data["auth-token"]);
                    localStorage.setItem("id", data.id);
                    localStorage.setItem("username", data.username);
                    localStorage.setItem("roles", JSON.stringify(data.roles)); // ✅ Store roles properly

                    // 👇 Tell Navbar to recheck login status immediately
                    eventBus.$emit('login-updated');

                    // Navigate based on role
                    if (data.roles.includes("admin")) {
                        this.$router.push('/admin');
                    } else {
                        this.$router.push('/user');
                    }
                } else {
                    this.message = data.message;
                }
            })
            .catch(err => {
                console.error("Login failed:", err);
                this.message = "Server error. Try again later.";
            });
        }
    }
};
