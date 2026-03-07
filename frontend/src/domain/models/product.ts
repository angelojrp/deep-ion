export interface ProductPhoto {
  id: string
  url: string
  alt: string
  principal: boolean
}

export interface ProductComment {
  id: string
  autor: string
  avatar: string
  nota: number
  titulo: string
  texto: string
  data: string
  curtidas: number
  verificado: boolean
}

export interface ProductSpecification {
  grupo: string
  nome: string
  valor: string
}

export interface ProductSeller {
  nome: string
  avaliacao: number
  totalVendas: number
}

export interface ProductShipping {
  gratis: boolean
  prazoMinimo: number
  prazoMaximo: number
}

export type StockStatus = 'EM_ESTOQUE' | 'ULTIMAS_UNIDADES' | 'ESGOTADO' | 'PRE_VENDA'

export interface Product {
  id: string
  nome: string
  slug: string
  descricao: string
  descricaoCurta: string
  preco: number
  precoPromocional: number | null
  sku: string
  categoria: string
  subcategoria: string
  marca: string
  estoque: number
  statusEstoque: StockStatus
  avaliacaoMedia: number
  totalAvaliacoes: number
  tags: string[]
  especificacoes: ProductSpecification[]
  fotos: ProductPhoto[]
  comentarios: ProductComment[]
  vendedor: ProductSeller
  frete: ProductShipping
  criadoEm: string
  atualizadoEm: string
}

export interface ProductListItem {
  id: string
  nome: string
  slug: string
  descricaoCurta: string
  preco: number
  precoPromocional: number | null
  categoria: string
  marca: string
  statusEstoque: StockStatus
  avaliacaoMedia: number
  totalAvaliacoes: number
  fotoPrincipal: string
}

export interface ProductListResponse {
  items: ProductListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
