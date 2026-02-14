import { MainLayout } from "@/components/MainLayout";
import { ReactNode } from "react";

export default function Dashboard() {
	return (
		<div>
			<h1>خوش آمدید</h1>
			<p>به پنل مدیریت خوش آمدید</p>
		</div>
	);
}

Dashboard.getLayout = function getLayout(page: ReactNode) {
	return <MainLayout>{page}</MainLayout>;
};
