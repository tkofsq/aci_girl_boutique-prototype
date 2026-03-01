
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabase = createClient(
        'https://moeyonokrqnsrhthkjyd.supabase.co',
        'sb_publishable_xdY5f0sBT-bzAqOBmCV0Eg_B6Vk3Z_C'
)

window.addEventListener('DOMContentLoaded', async () => {
        console.log("DOM is ready")
        
        const { data, error } = await supabase.from('Test').select('*')
        console.log(data)
})

/*
export const supabase = createClient(
        'https://moeyonokrqnsrhthkjyd.supabase.co',
        'sb_publishable_xdY5f0sBT-bzAqOBmCV0Eg_B6Vk3Z_C'
)
*/