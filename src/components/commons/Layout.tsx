import { Outlet } from "react-router"
import Header from "./Header";
import BottomNavBar from "./BottomNavBar";
import SyncToast from "./SyncToast";

const Layout = () => {
    return (
        <div className="bg-slate-100 min-h-screen pb-20">
            <Header />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </div>
            <BottomNavBar />
            <SyncToast />
        </div>

    );

}

export default Layout;