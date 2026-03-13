import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <>
            <header className="navbar bg-neutral backdrop-blur-xl shadow-sm">
                <div className="navbar-start">
                    <a href="#" className="btn btn-ghost text-xl font-bold">
                        SHEETRA
                    </a>
                </div>
                <div className="navbar-end">
                    <ul className="menu menu-horizontal [&>li]:mx-5 [&>li>a]:px-4">
                        <li>
                            <a href="#">Engine</a>
                        </li>
                        <li>
                            <a href="#">Privacy</a>
                        </li>
                        <li>
                            <a href="#" className="bg-primary">
                                Try Now
                            </a>
                        </li>
                    </ul>
                </div>
            </header>
            <HeroSection />
            <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content p-10">
                <nav>
                    <h6 className="footer-title">Services</h6>
                    <a href="#" className="link link-hover">
                        Branding
                    </a>
                    <a href="#" className="link link-hover">
                        Design
                    </a>
                    <a href="#" className="link link-hover">
                        Marketing
                    </a>
                    <a href="#" className="link link-hover">
                        Advertisement
                    </a>
                </nav>
                <nav>
                    <h6 className="footer-title">Company</h6>
                    <a href="#" className="link link-hover">
                        About us
                    </a>
                    <a href="#" className="link link-hover">
                        Contact
                    </a>
                    <a href="#" className="link link-hover">
                        Jobs
                    </a>
                    <a href="#" className="link link-hover">
                        Press kit
                    </a>
                </nav>
                <nav>
                    <h6 className="footer-title">Legal</h6>
                    <a href="#" className="link link-hover">
                        Terms of use
                    </a>
                    <a href="#" className="link link-hover">
                        Privacy policy
                    </a>
                    <a href="#" className="link link-hover">
                        Cookie policy
                    </a>
                </nav>
            </footer>
        </>
    );
}

function HeroSection() {
    return (
        <div className="hero flex flex-col md:flex-row items-center justify-center gap-10 p-4">
            <div className="w-full md:w-1/2 h-full">
                <div className="bg-primary p-2">
                    <p className="text-xs font-bold uppercase">V1.0 BETA RELEASE</p>
                </div>
                <div className="[&>h1]:text-4xl [&>h1]:md:text-6xl [&>h1]:lg:text-6xl">
                    <h1>MANUAL</h1>
                    <h1>DATA ENTRY</h1>
                    <hr />
                    <h1>TO</h1>
                    <hr />
                    <h1>AUTOMATION</h1>
                </div>
            </div>
            <div className="w-full md:w-1/2 h-full">
                <img src="/placeholder.svg" alt="Hero" className="rounded-lg shadow-lg" />
            </div>
        </div>
    );
}
