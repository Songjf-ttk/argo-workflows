minikube start
make manifests/install.yaml
kubectl create namespace argo
kubectl apply -n argo -f manifests/install.yaml
kubectl create secret -n argo generic argo-workflows-sso-id --from-literal=client-id=bb9812db6828b853cec9
kubectl create secret -n argo generic argo-workflows-sso-secret --from-literal=client-secret=8ca568df2709c9a662bc85b2ec3e6e42cea75382
argo server --auth-mode sso -n argo
kubectl patch deployment \
  argo-server \
  --namespace argo \
  --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/args", "value": [
  "server",
  "--auth-mode=server",
  "--secure=false"
]}]'
kubectl -n argo port-forward deployment/argo-server 2746:2746