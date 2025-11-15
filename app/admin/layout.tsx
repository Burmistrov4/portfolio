/**
 * @description Pass-through layout for admin routes.
 * @param {Object} props The props containing children.
 * @returns {JSX.Element} The layout.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  console.log('AdminLayout: Pass-through, rendering children')
  return <>{children}</>
}