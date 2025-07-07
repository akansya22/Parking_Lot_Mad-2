export default {
    template: `
    <div>
        <h2 class="my-2 text-center">Update your transaction!</h2>
        <div class="row border" style="width: 100%; margin: auto;">
            <div class="col-4 border" style="height: 570px;">
                <h2>Update Transactions</h2>
                <div class="mb-3">
                    <label for="name" class="form-label">Transaction Name</label>
                    <input type="text" class="form-control" id="name" v-model="transData.name">
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Transaction Type</label>
                    <input type="text" class="form-control" id="type" v-model="transData.type">
                </div>
                
                <div class="d-flex">
                    <div class="mb-3 mx-2">
                        <label for="source" class="form-label">Source City</label>
                        <select class="form-select" aria-label="Default select example" v-model="transData.source">
                            <option selected>Open this select menu</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Nagpur">Nagpur</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Pune">Pune</option>
                            <option value="Kolkata">Kolkata</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="destination" class="form-label">Destination City</label>
                        <select class="form-select" aria-label="Default select example" v-model="transData.destination">
                            <option selected>Open this select menu</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Nagpur">Nagpur</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Pune">Pune</option>
                            <option value="Kolkata">Kolkata</option>
                        </select>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="desc" class="form-label">Discription</label>
                    <textarea class="form-control" id="desc" rows="3" v-model="transData.desc"></textarea>
                </div>

                <div class="mb-3 text-end">
                    <button @click="updateTrans" class="btn btn-primary">Save</button>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            transData: {
                name: '',
                type: '',
                source: '',
                destination: '',
                desc: ''
            }
        }
    },
    methods: {
        updateTrans() {

        }
    }
}