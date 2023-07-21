import AppLogo from '../AppLogo'

const Footer = () => {
    return (
        <footer className="bg-gray-950 text-gray-100 border-gray-500 border-t py-2 text-center">
            <AppLogo textSize='text-xl' />
            <div className="container mx-auto">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} TuneTogether. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
export default Footer