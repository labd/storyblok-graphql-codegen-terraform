export type PluginConfig = {
  /**
   * The Id of the Storyblok space
   */
  space_id: number
  ct_endpoint?: string
  ct_client_id?: string
  ct_client_secret?: string
  ct_project_key?: string
  ct_locale?: string
  sort_resources?: boolean
}
