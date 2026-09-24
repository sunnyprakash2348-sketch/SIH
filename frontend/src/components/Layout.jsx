import Sidebar from "./Sidebar";

export default function Layout({ officer, children }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <div className="no-print">
        <Sidebar officer={officer} />
      </div>
      <main className="flex-1 px-8 py-8 max-w-6xl">{children}</main>
    </div>
  );
}
