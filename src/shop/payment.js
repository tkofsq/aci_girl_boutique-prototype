import { supabase } from '../shared/scripts/supabase.js'

window.addEventListener('DOMContentLoaded', async () => {
        window.checkout = async (ref, ph, name, addr, orderData) => {
            if (!orderData || orderData.length === 0) {
                return alert("Error: Could not retrieve basket data.");
            }
    
            const { error } = await supabase.rpc('process_order', {
                p_reference: ref,
                p_phone: ph,
                p_name: name,
                p_address: addr,
                p_order: orderData 
            });
    
            if (error) {
                alert("Checkout failed: " + error.message);
            } else {
                alert("Order successful!");
                localStorage.removeItem('basket');
                window.location.reload();
            }
        };
})

window.getLatestBasketData = async () => {
    const rawBasket = JSON.parse(localStorage.getItem('basket')) || [];
    if (rawBasket.length === 0) return [];

    const ids = rawBasket.map(item => item.id);

    // Fetch only the items currently in the basket
    const { data: items, error } = await supabase
        .from('Inventory')
        .select('id, name, final')
        .in('id', ids);

    if (error) {
        console.error("Fetch error:", error.message);
        return [];
    }

    // Merge the fetched details with the quantities from localStorage
    return rawBasket.map(cartItem => {
        const dbItem = items.find(i => i.id === cartItem.id);
        return {
            id: Number(cartItem.id),
            name: dbItem ? dbItem.name : "Unknown",
            qty: Number(cartItem.quantity),
            final: dbItem ? Number(dbItem.final) : 0
        };
    });
};
