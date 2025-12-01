export async function loadFooter() {
    const app = document.getElementById('app');
    
    const footer = document.createElement('footer');
    footer.className = 'bg-gray-800 text-white py-12';
    footer.innerHTML = `
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center space-x-2 mb-4">
                        <i class="fas fa-home text-blue-400 text-2xl"></i>
                        <span class="text-xl font-bold">SmartRent</span>
                    </div>
                    <p class="text-gray-400">Modern real estate and rental management platform connecting tenants, agents, and landlords.</p>
                </div>
                
                <div>
                    <h3 class="text-lg font-bold mb-4">Quick Links</h3>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/" class="hover:text-white transition" data-nav="/">Home</a></li>
                        <li><a href="#properties" class="hover:text-white transition" data-nav="/properties">Properties</a></li>
                        <li><a href="#about" class="hover:text-white transition" data-nav="/about">About Us</a></li>
                        <li><a href="#contact" class="hover:text-white transition" data-nav="/contact">Contact</a></li>
                    </ul>
                </div>
                
                <div>
                    <h3 class="text-lg font-bold mb-4">User Types</h3>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="#" class="hover:text-white transition">For Tenants</a></li>
                        <li><a href="#" class="hover:text-white transition">For Agents</a></li>
                        <li><a href="#" class="hover:text-white transition">For Landlords</a></li>
                        <li><a href="#" class="hover:text-white transition">For Admins</a></li>
                    </ul>
                </div>
                
                <div>
                    <h3 class="text-lg font-bold mb-4">Contact Info</h3>
                    <ul class="space-y-2 text-gray-400">
                        <li class="flex items-center">
                            <i class="fas fa-map-marker-alt mr-3 text-blue-400"></i>
                            <span>123 Property St, Lagos, Nigeria</span>
                        </li>
                        <li class="flex items-center">
                            <i class="fas fa-phone mr-3 text-blue-400"></i>
                            <span>+234 (800) 123-4567</span>
                        </li>
                        <li class="flex items-center">
                            <i class="fas fa-envelope mr-3 text-blue-400"></i>
                            <span>info@smartrent.com</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 SmartRent. All rights reserved.</p>
            </div>
        </div>
    `;
    
    app.appendChild(footer);
}