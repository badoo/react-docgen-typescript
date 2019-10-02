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
  showLoading?: boolean;
  type?: ImageType;
};

type Page = {
  index: number;
  image: Image;
};

type Gallery = {
  mainImage: Image;
  pages?: Page[];
};

type Props = {
  gallery: Gallery;
  status?: 'online' | 'idle' | 'hidden';
};

export const Stateless: React.SFC<Props> = props => <div>test</div>;

Stateless.defaultProps = {
  gallery: {
    mainImage: {
      src: '<src>'
    }
  }
};
