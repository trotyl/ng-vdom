rm -rf dist/tmp
rm -rf dist/ng-vdom/bootstrap
yarn ngc -p projects/ng-vdom-bootstrap/tsconfig.json
mv dist/tmp/projects/ng-vdom-bootstrap/src/lib/bootstrap.module.js dist/tmp/projects/ng-vdom-bootstrap/src/lib/bootstrap.module.internal.js
sed -i -e 's/bootstrap.module/bootstrap.module.internal/g' dist/tmp/projects/ng-vdom-bootstrap/src/lib/bootstrap.module.ngfactory.js
printf 'import { VDomBootstrapModule } from "./bootstrap.module.internal";\nimport { VDomBootstrapModuleNgFactory } from "./bootstrap.module.ngfactory";\nVDomBootstrapModule.ngFactory = VDomBootstrapModuleNgFactory;\nexport * from "./bootstrap.module.internal";\n' > dist/tmp/projects/ng-vdom-bootstrap/src/lib/bootstrap.module.js
mkdir -p dist/ng-vdom/bootstrap/lib
cp dist/tmp/projects/ng-vdom-bootstrap/*/*.d.ts dist/ng-vdom/bootstrap/
cp dist/tmp/projects/ng-vdom-bootstrap/src/*/*.d.ts dist/ng-vdom/bootstrap/lib/
yarn rollup --config rollup.config.js
yarn tsc --allowJs --skipLibCheck --target es5 --module es2015 --outDir dist/ng-vdom/bootstrap/fesm5 dist/ng-vdom/bootstrap/fesm2015/bootstrap.js
yarn rollup --config rollup.config.js --input dist/ng-vdom/bootstrap/fesm5/bootstrap.js --output.format umd --output.file dist/ng-vdom/bundles/ng-vdom-bootstrap.umd.js
yarn rollup --config rollup.config.js --input dist/ng-vdom/bootstrap/fesm5/bootstrap.js --output.format umd --output.file dist/ng-vdom/bundles/ng-vdom-bootstrap.umd.min.js --environment UGLIFY
cp projects/ng-vdom-bootstrap/package.json dist/ng-vdom/bootstrap/
