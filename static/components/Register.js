export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 620px;">
            <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
                <div>
                    <h2 class="text-center">Register Form</h2>
                    <div class="mx-2 mb-3">
                        <label for="email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="email" v-model="formData.email">
                    </div>
                    <div class="mx-2 mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input type="text" class="form-control" id="username" v-model="formData.username">
                    </div>
                    <div class="mx-2 mb-3">
                        <label for="pass" class="form-label">Password</label>
                        <input type="password" class="form-control" id="pass" v-model="formData.password">
                    </div>
                    <div class="mb-3 text-center">
                        <button class="btn btn-primary" @click="addUser">Register</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`,

    data: function() {
        return {
            formData: {
                email: '',
                username: '',
                password: ''
            }
        }
    },
    methods: {
        addUser: function() {
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    this.$router.push('/login');
                }
            })
            .catch(err => {
                alert("Server error. Please try again later.");
                console.error(err);
            });
        }
    }
}
