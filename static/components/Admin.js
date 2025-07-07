export default {
    template: `
    <div>
        <h2 class="mt-3 text-end">Welcome, {{ userData.username }}</h2>
        <div class="row border">
            <div class="col-8 border" style="height: 570px; overflow-y: scroll;">
                <h3 class="mt-3 text-primary fw-bold">Requested Transactions</h3>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Package Name</th>
                            <th scope="col">Source</th>
                            <th scope="col">Destination</th>
                            <th scope="col">Date</th>
                            <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="t in transactions" v-if="t.internal_status == 'requested'">
                                <td>{{ t.id }}</td>
                                <td>{{ t.name }}</td>
                                <td>{{ t.source }}</td>
                                <td>{{ t.destination }}</td>    
                                <td>{{ t.date.slice(0, 10) }}</td>                      
                                <td>
                                    <button @click="() => review(t)" class="btn btn-info btn-sm">Review</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                <h3 class="mt-3 text-warning fw-bold">Pending Transaction</h3>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Package Name</th>
                            <th scope="col">Source</th>
                            <th scope="col">Destination</th>
                            <th scope="col">Date</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="t in transactions" v-if="t.internal_status == 'pending'">
                                <td>{{ t.id }}</td>
                                <td>{{ t.name }}</td>
                                <td>{{ t.source }}</td>
                                <td>{{ t.destination }}</td>   
                                <td>{{ t.date.slice(0, 10) }}</td>
                                <td>{{ t.amount }}</td>                       
                                <td>
                                    <button class="btn btn-danger btn-sm">Rejected</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                <h3 class="mt-3 text-success fw-bold">Paid Transaction</h3>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Package Name</th>
                            <th scope="col">Source</th>
                            <th scope="col">Destination</th>
                            <th scope="col">Date</th>
                            <th scope="col">Delivary Status</th>
                            <th scope="col">Update Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="t in transactions" v-if="t.internal_status == 'paid'">
                                <td>{{ t.id }}</td>
                                <td>{{ t.name }}</td>
                                <td>{{ t.source }}</td>
                                <td>{{ t.destination }}</td>  
                                <td>{{ t.date.slice(0, 10) }}</td>
                                <td>{{ t.delivery_status }}</td>  
                                <td class="d-flex">
                                    <select class="form-select " style="width: 60%" v-model="delivery_status">
                                        <option selected>select menu</option>
                                        <option value="In-process">In process</option>
                                        <option value="In-transit">In Transit</option>
                                        <option value="Despatched">Dispatched</option>
                                        <option value="Out-for-delivery">Out For Delivery</option>
                                        <option value="Deliverd">Delivered</option>
                                    </select>
                                    <button @click="() => updateDelivery(t.id)" class="btn btn-primary btn-sm mt-2">Save</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
            </div>
            <div class="col-4 border text-center" style="height: 570px;">
                <h2>Review Transactions</h2>
                <div v-if="show_review" class="text-center">
                    <div>
                        <p class="fs-3">Transaction Name</p>
                        <p class="fs-4">{{ t.name }}</p>
                    </div>
                    <div>
                        <p class="fs-3">Transaction Type</p>
                        <p class="fs-4">{{ t.type }}</p>
                    </div>
                    <div>
                        <p class="fs-3">{{ t.source }} to {{ t.destination }}</p>
                    </div>
                    <div class="mb-3 mx-auto" style="width: 60%">
                        <label for="dellivery" class="form-label">Transaction Date</label>
                        <input type="date" class="form-control" id="delivery" v-model="t.delivery">
                    </div>
                    <div class="mb-3 mx-auto" style="width: 60%">
                        <label for="amount" class="form-label">Amount</label>
                        <input type="number" class="form-control" id="amount" v-model="t.amount">
                    </div>              
                    <div class="mb-3 text-end">
                        <button @click="() => save(t.id)" class="btn btn-primary">Save</button>
                    </div>                  
                </div>
                <div v-else class="text-center">
                    <p>Click on review button to see transaction details</p>
                </div>
            </div>
        </div>
    </div>`,
    data: function() {
        return {
            userData:"",
            transactions: null,
            show_review: false,
            delivery_status: '',
            t:{
                name: '',
                type: '',
                source: '',
                destination: '',
                delivery: '',
                amount: ''
            }
        }
    },
    mounted(){
        this.loadUser();
        this.loadTrans();
    },
    methods: {
        loadUser() {
            fetch('/api/home', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                },
            })
            .then(response => response.json())
            .then(data => this.userData = data)
        },
        loadTrans() {
            fetch('/api/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(data =>{
                console.log(data)
                this.transactions = data
            })
        },
        review(t) {
            this.show_review = true;
            console.log(t);
            this.t = t;
        },
        save(id) {
            fetch(`/api/review/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.t)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.$router.go(0); // Reload the page to reflect changes           
            })
        },
        updateDelivery(id) {
            fetch(`/api/delivery/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                },
                body: JSON.stringify({
                    status: this.delivery_status
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.$router.go(0); // Reload the page to reflect changes
            })
        }
    }
}