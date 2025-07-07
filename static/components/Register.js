export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 620px;">
            <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
                <div>
                    <h2 class="text-center">Register Form</h2>
                    <div>
                        <label for="email">Enter your email:</label>
                        <input type="email" id="email" v-model="formData.email">
                    </div>
                    <div>
                        <label for="username">Enter your username:</label>
                        <input type="string" id="username" v-model="formData.username">
                    </div>
                    <div>
                        <label for="pass">Enter your Password:</label>
                        <input type="password" id="pass" v-model="formData.password">
                    </div>
                    <div>
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
                body: JSON.stringify(this.formData) // the content goes to the backend as JSON string
            })
            .then(response => response.json())  // wait for the body to be available
            .then(data => {
                alert(data.message)
                this.$router.push('/login')
            })
        }
    }
}
