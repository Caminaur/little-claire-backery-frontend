export default function Hero() {
  return (
    <section className="bg-amber-50 dark:bg-stone-900 py-20 px-6 text-center transition-colors duration-200">
      <h1 className="text-5xl font-bold text-amber-900 dark:text-amber-300 mb-4">Little Claire Bakery</h1>
      <p className="text-xl text-amber-700 dark:text-amber-400 mb-8 max-w-xl mx-auto">
        Café artesanal, repostería y sabores que reconfortan el alma.
      </p>
      <a
        href="/menu-1.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-amber-600 dark:bg-amber-500 text-white px-8 py-3 rounded-full text-base font-medium hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors"
      >
        Ver menú
      </a>
    </section>
  )
}
