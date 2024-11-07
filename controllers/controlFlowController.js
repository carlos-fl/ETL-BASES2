export class ControlFlow {
  static redirectToHome(req, res) {
    res.redirect('home') 
  }

  static getHomeView(req, res) {
    res.render('home')
  }
}
