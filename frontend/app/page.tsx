import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50 to-white flex flex-col">
      {/* Header / Navbar simples */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-indigo-600">Carteira</span>
            <span className="text-xl font-semibold">Digital</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-indigo-600 hover:bg-indigo-50 transition"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-indigo-600 px-5 py-2.5 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Controle suas finanças de forma simples e segura
          </h1>

          <p className="text-xl text-gray-600 mb-10 md:mb-12">
            Transfira, receba e deposite dinheiro com facilidade. Tudo em um só
            lugar, com total transparência e reversão de operações quando
            necessário.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white hover:bg-indigo-700 transition shadow-md"
            >
              Começar agora — é grátis
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Features rápidas */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Segurança total</h3>
              <p className="text-gray-600">
                Autenticação segura e operações auditáveis.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="text-3xl mb-4">↔️</div>
              <h3 className="text-xl font-semibold mb-2">
                Transferências instantâneas
              </h3>
              <p className="text-gray-600">
                Envie e receba para outros usuários em segundos.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">Reversão fácil</h3>
              <p className="text-gray-600">
                Corrija erros ou reverta transações quando precisar.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer simples */}
      <footer className="border-t py-8 bg-white">
        <div className="mx-auto max-w-7xl px-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Carteira Digital • Feito com Next.js para
          fins de teste técnico
        </div>
      </footer>
    </div>
  );
}
