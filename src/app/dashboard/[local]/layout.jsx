import DashboardShell from "@/components/dashboard/DashboardShell";

export default function LocalDashboardLayout({ children, params }) {
	return <DashboardShell local={params.local}>{children}</DashboardShell>;
}
