use rocket::request::FromParam;
use std::path::PathBuf;

#[derive(Debug)]
pub struct AssetName(pub PathBuf);

impl AssetName {
    pub fn index_html() -> Self {
        AssetName(PathBuf::from("index.html"))
    }
}

impl AssetName {
    const EXTENSIONS: &'static [&'static str] = &[".css", ".js", ".map", ".svg", ".webmanifest"];
}

impl<'a> FromParam<'a> for AssetName {
    type Error = ();

    fn from_param(param: &'a str) -> Result<Self, Self::Error> {
        if Self::EXTENSIONS.iter().any(|&ext| param.ends_with(ext)) {
            PathBuf::from_param(param).map(AssetName).map_err(|_| ())
        } else {
            Err(())
        }
    }
}

#[cfg(debug_assertions)]
type AssetInner = rocket::fs::NamedFile;
#[cfg(not(debug_assertions))]
type AssetInner = packed_asset::PackedAsset;

#[derive(Responder)]
pub struct Asset(AssetInner);

impl Asset {
    pub async fn open(path: AssetName) -> Option<Asset> {
        #[cfg(debug_assertions)]
        {
            rocket::fs::NamedFile::open(std::path::Path::new("front/dist/").join(path.0))
                .await
                .ok()
                .map(Asset)
        }

        #[cfg(not(debug_assertions))]
        {
            use include_dir::{include_dir, Dir};
            use rocket::http::ContentType;

            const DIST: Dir = include_dir!("front/dist-prod/");
            let file = DIST.get_file(&path.0).map(|file| file.contents())?;
            let content_type = path
                .0
                .extension()
                .and_then(|ext| ContentType::from_extension(&ext.to_string_lossy()));

            Some(Asset(packed_asset::PackedAsset(file, content_type)))
        }
    }
}

#[cfg(not(debug_assertions))]
mod packed_asset {
    use rocket::http::ContentType;
    use rocket::response::Responder;
    use rocket::Request;

    pub struct PackedAsset(pub &'static [u8], pub Option<ContentType>);

    impl<'r> Responder<'r, 'static> for PackedAsset {
        fn respond_to(self, request: &'r Request<'_>) -> rocket::response::Result<'static> {
            let mut response = self.0.respond_to(request)?;
            if let Some(ct) = self.1 {
                response.set_header(ct);
            }

            Ok(response)
        }
    }
}
