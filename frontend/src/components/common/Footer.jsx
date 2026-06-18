export default function Footer() {
  return (
    <footer className="border-t border-border-light bg-white">
      <div className="section-wrap flex flex-col gap-3 py-8 text-[15px] text-text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold text-secondary">BookMyRoute</p>
          <p>Simple bus booking for everyday travel.</p>
        </div>
        <p>© {new Date().getFullYear()} BookMyRoute. All rights reserved.</p>
      </div>
    </footer>
  )
}
