import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  try {
    console.log('Creating admin user...')

    // Admin credentials for testing
    const adminEmail = 'admin@thuvien.edu.vn'
    const adminPassword = 'Admin@123456'

    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
      },
    })

    if (error) {
      console.error('Error creating admin user:', error)
      process.exit(1)
    }

    console.log('✅ Admin user created successfully!')
    console.log('\n📧 Admin Credentials:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('\n⚠️  IMPORTANT: Change this password after first login!')
    console.log(`User ID: ${data.user?.id}`)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

createAdminUser()
