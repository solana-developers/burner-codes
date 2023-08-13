/*
 */

type TreeOptions = {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
  proofBytes?: number;
  space?: number;
  cost?: number;
  message?: string;
};

/*
  General types for general uses
*/

/**
 *
 */
type SimpleLinkItem = {
  href: string;
  label: string;
  title?: string;
  // only allow icons from FontAwesome
  icon?: IconDefinition;
};

/**
 *
 */
type NavLinkOptions = {
  hrefBase?: string;
  navLinks?: Array<SimpleLinkItem>;
};

/**
 * Default props for all layouts
 */
type SimpleLayoutProps = {
  children: React.ReactNode;
  seo?: NextSeoProps;
  className?: string;

  /**
   * Single component containing Dialog components to be included within the layout
   */
  dialogs?: React.ReactNode;
};

/**
 * Default props for most components
 */
type SimpleComponentProps = {
  children?: React.ReactNode;
  className?: string;
};
