resource "storyblok_component" "a" {
  name        = "a"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    variantSku = {
      position     = 0
      display_name = "Variant sku"
      required     = false
      type         = "custom"
      field_type   = "sb-commercetools"
      options = [
        {
          name  = "endpoint"
          value = var.ct_endpoint
        },
        {
          name  = "clientId"
          value = var.ct_client_id
        },
        {
          name  = "clientSecret"
          value = var.ct_client_secret
        },
        {
          name  = "locale"
          value = "nl-NL"
        },
        {
          name  = "limit"
          value = "1"
        },
        {
          name  = "selectOnly"
          value = "product"
        }
      ]
    }
    variantSkus = {
      position     = 1
      display_name = "Variant skus"
      required     = false
      type         = "custom"
      field_type   = "sb-commercetools"
      options = [
        {
          name  = "endpoint"
          value = var.ct_endpoint
        },
        {
          name  = "clientId"
          value = var.ct_client_id
        },
        {
          name  = "clientSecret"
          value = var.ct_client_secret
        },
        {
          name  = "locale"
          value = "nl-NL"
        },
        {
          name  = "selectOnly"
          value = "product"
        }
      ]
    }
  }
}
