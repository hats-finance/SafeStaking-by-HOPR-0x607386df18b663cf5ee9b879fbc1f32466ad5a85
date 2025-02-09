use thiserror::Error;

#[derive(Error, Debug)]
pub enum NetworkingError {
    #[error("the network operation timed out after {0} seconds")]
    Timeout(u64),

    #[error("error in the messaging sub-protocol: {0}")]
    MessagingError(String),

    #[error("error while decoding message data")]
    DecodingError,

    #[error("{0}")]
    Other(String),
}

pub type Result<T> = core::result::Result<T, NetworkingError>;
