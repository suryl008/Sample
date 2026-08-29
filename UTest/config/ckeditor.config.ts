import {
  Alignment,
  AutoImage,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  Italic,
  Link,
  List,
  Paragraph,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
  Undo,
  type EditorConfig
} from 'ckeditor5';

const editorPlugins: EditorConfig['plugins'] = [
  Essentials, Paragraph, Heading, List, Indent, Link,
  Table, TableToolbar, BlockQuote, Bold, Italic, Underline,
  Strikethrough, Undo, FontColor, FontBackgroundColor, FontSize,
  Alignment, AutoImage, Image, ImageToolbar, ImageCaption,
  ImageStyle, ImageUpload, Base64UploadAdapter
];

export const GLOBAL_EDITOR_CONFIG1 = {
  placeholder: 'Type your content here...',
  plugins: editorPlugins,
  toolbar: [
    'undo', 'redo', '|', 'heading', 'fontSize',
    '|', 'bold', 'italic', 'underline', 'strikethrough', 'fontColor', 'fontBackgroundColor',
    '|', 'alignment', '|', 'link', 'uploadImage', 'insertTable', 'blockQuote',
    '|', 'bulletedList', 'numberedList', 'outdent', 'indent'
  ],
  fontSize: { options: [ 'tiny', 'default', 'big', 'huge' ] as const },
  alignment: { options: [ 'left', 'center', 'right', 'justify' ] as const },
  table: { contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ] as const },
  image: { toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption' ] as const }
} satisfies EditorConfig;

export const GLOBAL_EDITOR_CONFIG = {
  placeholder: 'Type your content message description here...',
  plugins: editorPlugins,
  toolbar: [
    'undo', 'redo',
    '|', 'heading', 'fontSize',
    '|', 'bold', 'italic', 'underline', 'strikethrough', 'fontColor', 'fontBackgroundColor',
    '|', 'alignment',
    '|', 'link', 'uploadImage', 'insertTable', 'blockQuote',
    '|', 'bulletedList', 'numberedList', 'outdent', 'indent'
  ],
  heading: {
    options: [
      { model: 'paragraph' as const, title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading1' as const, view: 'h1' as const, title: 'Heading 1', class: 'ck-heading_heading1' },
      { model: 'heading2' as const, view: 'h2' as const, title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3' as const, view: 'h3' as const, title: 'Heading 3', class: 'ck-heading_heading3' }
    ]
  },
  fontSize: {
    options: [ 'tiny', 'default', 'big', 'huge' ] as const
  },
  alignment: {
    options: [ 'left', 'center', 'right', 'justify' ] as const
  },
  table: {
    contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ] as const
  },
  image: {
    toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ] as const
  }
} satisfies EditorConfig;

