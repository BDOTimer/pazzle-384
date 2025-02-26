#ifndef DEBUG_H
#define DEBUG_H
/// "debug.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:
#include <filesystem> /// C++17
#include <algorithm>
#include <iostream>
#include <iterator>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <memory>
#include <format>  /// C++20
#include <vector>
#include <string>
#include <cmath>
#include <map>
#include <set>

namespace fs = std::filesystem;
void tests();

#define ln(a) std::cout << #a << ":\n" << (a) << '\n';
#define  l(a) std::cout << #a << ": "  << (a) << '\n';
#define TEST friend void ::tests(); static void test()

#define ASSERT(a) if(!(a)) \
{   std::cout << "ASSERT_ERROR: " \
              << "FILE: \"" << cutStr(__FILE__)  << "\", " \
              << "LINE: "   << __LINE__ \
              << "\n"; throw(-1); }

inline std::string_view cutStr(std::string_view s)
{   auto p = s.rfind("sources"); return s.substr(p, s.size() - p);
}

#define TRY(a) try{a;}catch(...){std::cout << "ERROR exeption: " << #a << '\n';}



#endif // DEBUG_H
