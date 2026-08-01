interface ItemImageProps {
  imageUrl?: string;
}

export default function ItemImage({ imageUrl }: ItemImageProps) {
  if (!imageUrl) {
    return (
      <div className="item-image" aria-label="Item placeholder">
        <div className="item-image__placeholder">No image</div>
      </div>
    );
  }

  return (
    <div className="item-image">
      <img src={imageUrl} alt="Item preview" />
    </div>
  );
}
