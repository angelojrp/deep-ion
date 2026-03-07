import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Star,
  Truck,
  ShieldCheck,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  BadgeCheck,
  ShoppingCart,
  Package,
  Store,
  AlertCircle,
} from 'lucide-react'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useProduct } from '@application/hooks/useProducts'
import { cn } from '@shared/utils/cn'
import type { Product, ProductPhoto, ProductComment, StockStatus } from '@domain/models/product'

// ── Helpers ──

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const STOCK_CONFIG: Record<StockStatus, { label: string; color: string; bgColor: string }> = {
  EM_ESTOQUE: { label: 'Em estoque', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  ULTIMAS_UNIDADES: { label: 'Últimas unidades', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  ESGOTADO: { label: 'Esgotado', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  PRE_VENDA: { label: 'Pré-venda', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
}

// ── Photo Gallery ──

function PhotoGallery({ fotos }: { fotos: ProductPhoto[] }) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-border">
        <img
          src={fotos[selected]?.url}
          alt={fotos[selected]?.alt}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="listbox" aria-label="Fotos do produto">
          {fotos.map((foto, i) => (
            <button
              key={foto.id}
              type="button"
              role="option"
              aria-selected={i === selected}
              onClick={() => setSelected(i)}
              className={cn(
                'h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                i === selected
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <img
                src={foto.url}
                alt={foto.alt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Star Rating ──

function StarRating({ rating, total, size = 'md' }: { rating: number; total?: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center" aria-label={`${rating} de 5 estrelas`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              iconSize,
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < rating
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600',
            )}
          />
        ))}
      </div>
      {total !== undefined && (
        <span className={cn('text-text-muted', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {rating.toFixed(1)} ({total} avaliações)
        </span>
      )}
    </div>
  )
}

// ── Price Card ──

function PriceSection({ product }: { product: Product }) {
  const { t } = useTranslation()
  const hasDiscount = product.precoPromocional !== null && product.precoPromocional < product.preco
  const discountPercent = hasDiscount
    ? Math.round(((product.preco - product.precoPromocional!) / product.preco) * 100)
    : 0
  const stock = STOCK_CONFIG[product.statusEstoque]

  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
      {/* Price */}
      <div>
        {hasDiscount && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-text-muted line-through">{formatBRL(product.preco)}</span>
            <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
              -{discountPercent}%
            </span>
          </div>
        )}
        <span className={cn('text-3xl font-bold', hasDiscount ? 'text-green-600 dark:text-green-400' : 'text-text')}>
          {formatBRL(hasDiscount ? product.precoPromocional! : product.preco)}
        </span>
        {hasDiscount && (
          <p className="text-xs text-text-muted mt-1">
            {t('products.detail.savings', { value: formatBRL(product.preco - product.precoPromocional!) })}
          </p>
        )}
      </div>

      {/* Installments */}
      <p className="text-sm text-text-muted">
        {t('products.detail.installments', {
          count: 12,
          value: formatBRL((hasDiscount ? product.precoPromocional! : product.preco) / 12),
        })}
      </p>

      {/* Stock */}
      <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium', stock.bgColor, stock.color)}>
        <Package className="h-4 w-4" />
        {t(`products.stock.${product.statusEstoque}`, stock.label)}
        {product.statusEstoque === 'ULTIMAS_UNIDADES' && (
          <span className="text-xs">({product.estoque} restantes)</span>
        )}
      </div>

      {/* Shipping */}
      <div className="flex items-center gap-2 text-sm">
        <Truck className={cn('h-4 w-4', product.frete.gratis ? 'text-green-500' : 'text-text-muted')} />
        {product.frete.gratis ? (
          <span className="text-green-600 dark:text-green-400 font-medium">{t('products.detail.freeShipping')}</span>
        ) : (
          <span className="text-text-muted">{t('products.detail.shippingCalc')}</span>
        )}
        <span className="text-xs text-text-muted">
          ({product.frete.prazoMinimo}-{product.frete.prazoMaximo} {t('products.detail.businessDays')})
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          disabled={product.statusEstoque === 'ESGOTADO'}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all',
            product.statusEstoque === 'ESGOTADO'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98]',
          )}
          aria-label={t('products.detail.addToCart')}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.statusEstoque === 'ESGOTADO'
            ? t('products.detail.unavailable')
            : t('products.detail.addToCart')}
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text text-sm font-medium hover:bg-surface-hover transition-colors"
            aria-label={t('products.detail.favorite')}
          >
            <Heart className="h-4 w-4" />
            {t('products.detail.favorite')}
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-text text-sm font-medium hover:bg-surface-hover transition-colors"
            aria-label={t('products.detail.share')}
          >
            <Share2 className="h-4 w-4" />
            {t('products.detail.share')}
          </button>
        </div>
      </div>

      {/* Seller info */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-text-muted" />
          <span className="text-sm font-medium text-text">{product.vendedor.nome}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {product.vendedor.avaliacao}
          </span>
          <span>{product.vendedor.totalVendas.toLocaleString('pt-BR')} {t('products.detail.sales')}</span>
        </div>
      </div>

      {/* Guarantee */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <ShieldCheck className="h-4 w-4 text-green-500" />
        {t('products.detail.guarantee')}
      </div>
    </div>
  )
}

// ── Specifications ──

function SpecificationsSection({ product }: { product: Product }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const groups = product.especificacoes.reduce<Record<string, { nome: string; valor: string }[]>>((acc, spec) => {
    if (!acc[spec.grupo]) acc[spec.grupo] = []
    acc[spec.grupo].push({ nome: spec.nome, valor: spec.valor })
    return acc
  }, {})

  const groupEntries = Object.entries(groups)
  const visibleGroups = expanded ? groupEntries : groupEntries.slice(0, 2)

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold text-text mb-4">{t('products.detail.specifications')}</h2>
      <div className="space-y-6">
        {visibleGroups.map(([grupo, specs]) => (
          <div key={grupo}>
            <h3 className="text-sm font-semibold text-primary mb-2">{grupo}</h3>
            <div className="divide-y divide-border">
              {specs.map((spec) => (
                <div key={spec.nome} className="flex justify-between py-2 text-sm">
                  <span className="text-text-muted">{spec.nome}</span>
                  <span className="text-text font-medium text-right">{spec.valor}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {groupEntries.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {expanded ? t('products.detail.showLess') : t('products.detail.showAll')}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}

// ── Comments / Reviews ──

function RatingDistribution({ comments }: { comments: ProductComment[] }) {
  const total = comments.length
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: comments.filter((c) => c.nota === star).length,
    pct: total > 0 ? (comments.filter((c) => c.nota === star).length / total) * 100 : 0,
  }))

  return (
    <div className="space-y-1.5">
      {distribution.map(({ star, count, pct }) => (
        <div key={star} className="flex items-center gap-2 text-sm">
          <span className="w-3 text-right text-text-muted">{star}</span>
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-6 text-right text-xs text-text-muted">{count}</span>
        </div>
      ))}
    </div>
  )
}

function CommentCard({ comment }: { comment: ProductComment }) {
  return (
    <div className="border-b border-border last:border-0 py-4 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {comment.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text">{comment.autor}</span>
              {comment.verificado && (
                <span className="inline-flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verificado
                </span>
              )}
            </div>
            <span className="text-xs text-text-muted">{formatDate(comment.data)}</span>
          </div>
        </div>
        <StarRating rating={comment.nota} size="sm" />
      </div>
      <h4 className="text-sm font-semibold text-text mt-3">{comment.titulo}</h4>
      <p className="text-sm text-text-muted mt-1 leading-relaxed">{comment.texto}</p>
      <div className="flex items-center gap-1 mt-3">
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors"
          aria-label={`Curtir comentário de ${comment.autor}`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          {comment.curtidas}
        </button>
      </div>
    </div>
  )
}

function CommentsSection({ product }: { product: Product }) {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  const visibleComments = showAll ? product.comentarios : product.comentarios.slice(0, 3)
  const avg = product.avaliacaoMedia

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold text-text mb-6">{t('products.detail.reviews')}</h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-border">
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl font-bold text-text">{avg.toFixed(1)}</span>
          <StarRating rating={avg} size="sm" />
          <span className="text-xs text-text-muted">{product.totalAvaliacoes} {t('products.detail.reviewsCount')}</span>
        </div>
        <div className="flex-1">
          <RatingDistribution comments={product.comentarios} />
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-0">
        {visibleComments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>

      {product.comentarios.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {showAll ? t('products.detail.showLessReviews') : t('products.detail.showAllReviews', { count: product.comentarios.length })}
          {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}

// ── Main Page ──

function ProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, isError, refetch } = useProduct(id ?? '')

  // Loading skeleton
  if (isLoading) {
    return (
      <>
        <Header />
        <PageContainer>
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </PageContainer>
      </>
    )
  }

  // Error
  if (isError || !product) {
    return (
      <>
        <Header />
        <PageContainer>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-sm text-red-500">{t('common.error')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              {t('common.retry')}
            </button>
          </div>
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Header title={product.nome} />
      <PageContainer>
        {/* Back button + breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
            aria-label={t('products.detail.backToProducts')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('products.detail.backToProducts')}
          </button>
          <span className="text-text-muted">/</span>
          <span className="text-sm text-text-muted">{product.categoria}</span>
          <span className="text-text-muted">/</span>
          <span className="text-sm text-text-muted">{product.subcategoria}</span>
        </div>

        {/* Main content: photos + price card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Photos */}
          <div className="lg:col-span-5">
            <PhotoGallery fotos={product.fotos} />
          </div>

          {/* Product info */}
          <div className="lg:col-span-4 space-y-4">
            {/* Brand + SKU */}
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <span className="font-medium text-primary">{product.marca}</span>
              <span>|</span>
              <span>SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-text leading-tight">{product.nome}</h1>

            {/* Rating */}
            <StarRating rating={product.avaliacaoMedia} total={product.totalAvaliacoes} />

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="pt-2">
              <h2 className="text-sm font-semibold text-text mb-2">{t('products.detail.description')}</h2>
              <p className="text-sm text-text-muted leading-relaxed">{product.descricao}</p>
            </div>
          </div>

          {/* Price card (sticky on desktop) */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-4">
              <PriceSection product={product} />
            </div>
          </div>
        </div>

        {/* Specifications + Reviews */}
        <div className="mt-10 space-y-8">
          <SpecificationsSection product={product} />
          <CommentsSection product={product} />
        </div>
      </PageContainer>
    </>
  )
}

export { ProductDetailPage }
