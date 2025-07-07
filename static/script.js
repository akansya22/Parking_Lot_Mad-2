import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import User from './components/User.js';
import Admin from './components/Admin.js';



const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/user', component: User},
    {path: '/admin', component: Admin},
]

const router = new VueRouter({
    routes // routes: routes
})

const app = new Vue({
    el: '#app',
    router, // router: router
    template:
    `
    <div class="container">
        <nav-bar></nav-bar>
        <router-view></router-view>
        <foot></foot>
    </div>
    `,

    data: {
        section : 'forntend',
    },
    components: {
        'nav-bar': Navbar,
        'foot': Footer,
    }
})