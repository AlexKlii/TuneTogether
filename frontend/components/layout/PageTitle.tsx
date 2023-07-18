const PageTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (<h1 className={`text-center text-4xl font-semibold pb-20 ${className}`}>{children}</h1>)
}
export default PageTitle