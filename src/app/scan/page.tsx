import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect to home with start=1 to open the wizard at Step 1
  redirect('/?start=1')
}
