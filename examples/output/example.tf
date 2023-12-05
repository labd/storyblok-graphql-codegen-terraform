resource "storyblok_component" "article" {
  name        = "article"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    date = {
      position     = 0
      display_name = "Date"
      required     = false
      type         = "datetime"
      disable_time = true
    }
    author = {
      position     = 1
      display_name = "Author"
      required     = false
      type         = "text"
    }
    content = {
      position      = 2
      translatable  = true
      display_name  = "Content"
      required      = false
      type          = "markdown"
      rich_markdown = true
    }
  }
}

resource "storyblok_component" "banner_block" {
  name        = "banner_block"
  space_id    = 123
  is_root     = false
  is_nestable = true
  icon        = "block-image"
  schema = {
    title = {
      position     = 0
      translatable = true
      display_name = "Title"
      required     = false
      type         = "text"
    }
    link = {
      position     = 1
      display_name = "Link"
      required     = false
      type         = "multilink"
    }
    image = {
      position     = 2
      display_name = "Image"
      required     = true
      type         = "asset"
      filetypes = [
        "images"
      ]
    }
  }
}

resource "storyblok_component" "markdown_block" {
  name        = "markdown_block"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    content = {
      position      = 0
      translatable  = true
      display_name  = "Content"
      required      = false
      type          = "markdown"
      rich_markdown = true
    }
  }
}

resource "storyblok_component" "page" {
  name        = "page"
  space_id    = 123
  is_root     = true
  is_nestable = false
  schema = {
    seoTitle = {
      position     = 0
      translatable = true
      display_name = "Seo title"
      required     = false
      type         = "text"
    }
    seoDescription = {
      position     = 1
      translatable = true
      display_name = "Seo description"
      required     = false
      type         = "text"
    }
    blocks = {
      position     = 2
      display_name = "Blocks"
      required     = false
      type         = "bloks"
      component_whitelist = [
        "markdown_block",
        "banner_block"
      ]
      restrict_components = true
    }
    sectionSeo = {
      position     = 3
      type         = "section"
      display_name = "SEO"
      keys = [
        "seoTitle",
        "seoDescription"
      ]
    }
  }
}

resource "storyblok_component" "product_list_block" {
  name        = "product_list_block"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    title = {
      position     = 0
      translatable = true
      display_name = "Title"
      required     = false
      type         = "text"
    }
  }
}

