import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect to Step 2 of the wizard
  redirect('/?start=1&step=2')
}
