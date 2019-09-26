import * as React from 'react';

enum ImageType {
  JPG,
  WEBP,
  GIF
}

type Image = {
  /** src description */
  src: string;
  /** showLoading description */
  showLoading: boolean;
  type: ImageType;
};

type Page = {
  index: number;
  image: Image;
};

type Gallery = {
  mainImage: Image;
  pages: Page[];
};

type Props = {
  gallery: Gallery;
};

export const Stateless: React.StatelessComponent<Props> = props => (
  <div>test</div>
);
