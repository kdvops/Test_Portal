export enum StyleSection {
  // STYLES CARDS SECTIONS
  cardsXSmall = 'cards::xsmall',
  cardsSmall = 'cards::small',
  cardsMedium = 'cards::medium',
  cardsLarge = 'cards::large',
  cardsXLarge = 'cards::xlarge',

  // STYLES BANNER SECTIONS
  bannerMedium = 'banner::medium',
  bannerLarge = 'banner::large',

  // STYLES ATTACHMENTS SECTIONS
  attachmentsMedium = 'attachments::medium',
  attachmentsLarge = 'attachments::large',

  // STYLES IMAGE SECTIONS
  imageSmall = 'image::small',
  imageMedium = 'image::medium',
  imageLarge = 'image::large',
  imageCover = 'image::cover',

  // STYLES TEXT SECTIONS
  textMedium = 'text::medium',
  textLarge = 'text::large',

  // STYLES VIDEO SECTIONS
  videoMedium = 'video::medium',
  videoLarge = 'video::large',

  // STYLES VIDEO SECTIONS
  tableSmall = 'table::small',
  tableMedium = 'table::medium',
  tableLarge = 'table::large',
}

export enum TypeSection {
  sectionCards = 'section::cards',
  sectionAttachments = 'section::attachments',
  sectionBanner = 'section::banner',
  sectionImage = 'section::image',
  sectionText = 'section::text',
  sectionVideo = 'section::video',
  sectionTable = 'section::table',
  sectionGrids = 'section::grids',
  sectionGallery = 'section::gallery',
  sectionAccordion = 'section::accordion',
}

export enum GridElementStyle {
  // STYLES ELEMENT
  sizeSmall = 'grid::element::size::small',
  sizeMedium = 'grid::element::size::medium',
  sizeLarge = 'grid::element::size::large',

  // STYLES TEXT
  weightNormal = 'grid::element::weight::normal',
  weightBold = 'grid::element::weight::bold',

  alignLeft = 'grid::element::align::left',
  alignCenter = 'grid::element::align::center',
  alignRight = 'grid::element::align::right',

  // STYLES BADGE
  badgeTopLeft = 'badge::small',
  badgeTopRight = 'badge::medium',

  borderNormal = 'grid::border::normal',
  borderShadow = 'grid::border::shadow',
}

export enum GridStyle {
  sizeXSmall = 'grid::size::xsmall',
  sizeSmall = 'grid::size::small',
  sizeMedium = 'grid::size::medium',
  sizeLarge = 'grid::size::large',
  sizeXLarge = 'grid::size::xlarge',

  styleFlat = 'grid::style::flat',
  styleShadow = 'grid::style::shadow',

  orientationNormal = 'grid::orientation::normal',
  orientationLandscape = 'grid::orientation::landscape',
  orientationLarged = 'grid::orientation::larged',
}

export enum GridElementType {
  // STYLES ELEMENT
  text = 'grid::element::type::text',
  button = 'grid::element::type::button',
  image = 'grid::element::type::image',
  list = 'grid::element::type::list',
}
