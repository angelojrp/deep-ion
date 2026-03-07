import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, ShoppingBag, Star, X } from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useProducts } from '@application/hooks/useProducts'
import { cn } from '@shared/utils/cn'
import type { ProductListItem, StockStatus } from '@domain/models/product'

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const STOCK_CONFIG: Record<StockStatus, { label: string; className: string }> = {
  EM_ESTOQUE: { label: 'Em estoque', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  ULTIMAS_UNIDADES: { label: 'Últimas unidades', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  ESGOTADO: { label: 'Esgotado', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  PRE_VENDA: { label: 'Pré-venda', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
}

function StockBadge({ status }: { status: StockStatus }) {
  const { t } = useTranslation()
  const config = STOCK_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', config.className)}>
      {t(`products.stock.${status}`, config.label)}
    </span>
  )
}

function StarRating({ rating, total }: { rating: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" aria-label={`${rating} de 5 estrelas`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              'h-3.5 w-3.5',
              i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600',
            )}
          />
        ))}
      </div>
      <span className="text-xs text-text-muted">({total})</span>
    </div>
  )
}

function ProductCard({ product, onClick }: { product: ProductListItem; onClick: () => void }) {
  const { t } = useTranslation()
  const hasDiscount = product.precoPromocional !== null && product.precoPromocional < product.preco
  const discountPercent = hasDiscount
    ? Math.round(((product.preco - product.precoPromocional!) / product.preco) * 100)
    : 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-surface',
        'hover:shadow-lg hover:border-primary/30 transition-all duration-200',
        'text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        product.statusEstoque === 'ESGOTADO' && 'opacity-75',
      )}
      aria-label={t('products.viewProduct', { name: product.nome })}
    >
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          -{discountPercent}%
        </div>
      )}

      {/* Image */}
      <div className="aspect-square w-full overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-800">
        <img
          src={product.fotoPrincipal}
          alt={product.nome}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-muted font-medium">{product.marca}</span>
          <StockBadge status={product.statusEstoque} />
        </div>

        <h3 className="text-sm font-semibold text-text line-clamp-2 group-hover:text-primary transition-colors">
          {product.nome}
        </h3>

        <p className="text-xs text-text-muted line-clamp-2">{product.descricaoCurta}</p>

        <StarRating rating={product.avaliacaoMedia} total={product.totalAvaliacoes} />

        <div className="mt-auto pt-2">
          {hasDiscount ? (
            <div className="flex flex-col">
              <span className="text-xs text-text-muted line-through">{formatBRL(product.preco)}</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatBRL(product.precoPromocional!)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-text">{formatBRL(product.preco)}</span>
          )}
        </div>
      </div>
    </button>
  )
}

function ProductsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      if (searchTimeout) clearTimeout(searchTimeout)
      const tid = setTimeout(() => {
        setDebouncedSearch(value)
      }, 300)
      setSearchTimeout(tid)
    },
    [searchTimeout],
  )

  const { data, isLoading, isError, refetch } = useProducts({
    search: debouncedSearch || undefined,
  })

  return (
    <>
      <Header title={t('products.title')} subtitle={t('products.subtitle')} />
      <PageContainer>
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('products.searchPlaceholder')}
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-lg',
                'bg-surface border border-border text-text text-sm',
                'placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              )}
              aria-label={t('products.searchPlaceholder')}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setDebouncedSearch('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                aria-label={t('common.close')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-sm text-red-500">{t('common.error')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              {t('common.retry')}
            </button>
          </div>
        )}

        {/* Empty */}
        {data && data.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingBag className="h-12 w-12 text-text-muted" />
            <p className="text-sm text-text-muted">{t('common.noResults')}</p>
          </div>
        )}

        {/* Products grid */}
        {data && data.items.length > 0 && (
          <>
            <p className="text-sm text-text-muted mb-4">
              {t('products.resultsCount', { count: data.total })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => navigate(`/products/${product.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </PageContainer>
    </>
  )
}

export { ProductsPage }
