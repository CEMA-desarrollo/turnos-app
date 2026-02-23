'use strict'
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    const { data: turnos } = await supabase.from('turnos_sabado').select('*').order('fecha', { ascending: true })
    const { data: fisios } = await supabase.from('fisioterapeutas').select('*')

    const counts = {}
    fisios.forEach(f => counts[f.nombre] = 0)

    console.log('\n--- CALENDARIO DE TURNOS ---')
    turnos.forEach(t => {
        const f1 = fisios.find(f => f.id === t.fisio1_id)
        const f2 = fisios.find(f => f.id === t.fisio2_id)
        const name1 = f1 ? f1.nombre : 'Vacio'
        const name2 = f2 ? f2.nombre : 'Vacio'

        if (f1 && t.estado !== 'cancelado') counts[name1]++
        if (f2 && t.estado !== 'cancelado') counts[name2]++

        console.log(`${t.fecha}: ${name1} & ${name2}`)
    })

    console.log('\n--- TOTALES ACUMULADOS ---')
    console.table(counts)
}

run()
