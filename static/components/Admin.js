export default {
    data() {
        return {
            lots: [],
            newLot: {
                location_name: '',
                pin_code: '',
                price: '',
                number_of_spots: ''
            },
            message: '',
            username: localStorage.getItem("username")
        };
    },
    methods: {
        async fetchLots() {
            try {
                const res = await fetch("/api/get", {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem("token")
                    }
                });
                const data = await res.json();
                this.lots = data;
            } catch (err) {
                console.error("Failed to fetch lots", err);
            }
        },
        async createLot() {
            try {
                const res = await fetch("/api/create", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem("token")
                    },
                    body: JSON.stringify(this.newLot)
                });
                const data = await res.json();
                this.message = data.message;
                this.fetchLots();
                this.newLot = {
                    location_name: '',
                    pin_code: '',
                    price: '',
                    number_of_spots: ''
                };
            } catch (err) {
                console.error("Failed to create lot", err);
            }
        },
        async deleteLot(id) {
            if (!confirm("Are you sure you want to delete this parking lot?")) return;

            try {
                const res = await fetch(`/api/delete/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem("token")
                    }
                });
                const data = await res.json();
                this.message = data.message;
                this.fetchLots();
            } catch (err) {
                console.error("Failed to delete lot", err);
            }
        }
    },
    mounted() {
        this.fetchLots();
    },
    template: `
        <div class="container mt-4">
            <h2 class="text-end text-success">Welcome, {{ username }}</h2>
            <h3 class="text-center text-primary">Admin - Parking Lot Management</h3>

            <div class="alert alert-info mt-3" v-if="message">{{ message }}</div>

            <h4 class="mt-4">Create New Parking Lot</h4>
            <form @submit.prevent="createLot" class="row g-3">
                <div class="col-md-4">
                    <input v-model="newLot.location_name" type="text" class="form-control" placeholder="Location Name" required>
                </div>
                <div class="col-md-3">
                    <input v-model="newLot.pin_code" type="text" class="form-control" placeholder="PIN Code" required>
                </div>
                <div class="col-md-2">
                    <input v-model="newLot.price" type="number" step="0.01" class="form-control" placeholder="Price" required>
                </div>
                <div class="col-md-2">
                    <input v-model="newLot.number_of_spots" type="number" class="form-control" placeholder="Spots" required>
                </div>
                <div class="col-md-1">
                    <button type="submit" class="btn btn-success">Create</button>
                </div>
            </form>

            <h4 class="mt-5">Existing Parking Lots</h4>
            <table class="table table-bordered mt-3">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Location</th>
                        <th>PIN</th>
                        <th>Price</th>
                        <th>Total Spots</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="lot in lots" :key="lot.id">
                        <td>{{ lot.id }}</td>
                        <td>{{ lot.location_name }}</td>
                        <td>{{ lot.pin_code }}</td>
                        <td>{{ lot.price }}</td>
                        <td>{{ lot.number_of_spots }}</td>
                        <td>
                            <button class="btn btn-danger btn-sm" @click="deleteLot(lot.id)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
};
