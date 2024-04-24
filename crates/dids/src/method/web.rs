use crate::{
    bearer::BearerDid,
    method::{Method, MethodError, ResolutionResult},
};
use did_web::DIDWeb as SpruceDidWebMethod;
use keys::key_manager::KeyManager;
use ssi_dids::did_resolve::{DIDResolver, ResolutionInputMetadata};
use std::sync::Arc;

/// Concrete implementation for a did:web DID
pub struct DidWeb {}

/// Options that can be used to create a did:web DID.
/// This is currently a unit struct because did:web does not support key creation.
pub struct DidWebCreateOptions;

impl Method<DidWebCreateOptions> for DidWeb {
    const NAME: &'static str = "web";

    fn create(
        _key_manager: Arc<dyn KeyManager>,
        _options: DidWebCreateOptions,
    ) -> Result<BearerDid, MethodError> {
        Err(MethodError::DidCreationFailure(
            "create operation not supported for did:web".to_string(),
        ))
    }

    async fn resolve(did_uri: &str) -> ResolutionResult {
        let input_metadata = ResolutionInputMetadata::default();
        let (spruce_resolution_metadata, spruce_document, spruce_document_metadata) =
            SpruceDidWebMethod.resolve(did_uri, &input_metadata).await;

        match ResolutionResult::from_spruce(
            spruce_resolution_metadata,
            spruce_document,
            spruce_document_metadata,
        ) {
            Ok(r) => r,
            Err(e) => ResolutionResult::from_error(e),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use keys::key_manager::local_key_manager::LocalKeyManager;

    #[test]
    fn create_fails() {
        let key_manager = Arc::new(LocalKeyManager::new_in_memory());
        let result = DidWeb::create(key_manager, DidWebCreateOptions);
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn resolution_success() {
        let did_uri = "did:web:tbd.website";
        let result = DidWeb::resolve(did_uri).await;
        assert!(result.did_resolution_metadata.error.is_none());

        let did_document = result.did_document.expect("did_document not found");
        assert_eq!(did_document.id, did_uri);
    }

    #[tokio::test]
    async fn resolution_failure() {
        let result = DidWeb::resolve("did:web:does-not-exist").await;
        assert!(result.did_resolution_metadata.error.is_some());
    }
}